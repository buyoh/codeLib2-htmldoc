#!/usr/bin/env ruby

require 'optparse'
require 'pathname'

# src/lib/CodeLib/types.ts の isValidArticlePath と同じ条件
ARTICLE_PATH_PATTERN = %r{\A/(?:[A-Za-z0-9_.-]+/)*[A-Za-z0-9_.-]+\z}.freeze

# 出力先にコピーしないファイル
EXCLUDED_BASENAMES = ['.gitignore'].freeze

def relative_path(path, base)
  Pathname.new(File.absolute_path(path)).relative_path_from(File.dirname(File.absolute_path(base))).to_s
end

def valid_article_path?(path)
  path.is_a?(String) && path.valid_encoding? && ARTICLE_PATH_PATTERN.match?(path) &&
    path.split('/').none? { |seg| ['.', '..'].include?(seg) }
end

# symlink を解決した絶対パス。末尾側は存在しなくてもよい
def real_path(path)
  path = File.absolute_path(path)
  return File.realpath(path) if File.exist?(path)
  return path if File.dirname(path) == path

  File.join(real_path(File.dirname(path)), File.basename(path))
end

def previous_output?(dir)
  File.file?("#{dir}/index.html") && File.file?("#{dir}/data/codelib_full.json")
end

# 作成先や親ディレクトリが public のファイル・symlink や他の記事の作成先と衝突するか。
# File.exist? は壊れた symlink に false を返すため File.symlink? も見る
def conflict?(rel, link_paths, public_path)
  in_public = File.join(public_path, rel)
  return true if File.symlink?(in_public) || File.exist?(in_public)

  Pathname.new(rel).dirname.ascend.any? do |parent|
    public_parent = File.join(public_path, parent.to_s)
    link_paths.include?(parent.to_s) || File.symlink?(public_parent) || File.file?(public_parent)
  end
end

@output_path = nil
@public_path = "#{__dir__}/../public"

opt = OptionParser.new
opt.on('--output-path /var/www/codeLib2') { |v| @output_path = v }
opt.on('--public-path public') { |v| @public_path = v }
opt.parse!(ARGV)

abort '--output-path is required' if @output_path.nil? || @output_path.empty?

@output_path = real_path(@output_path)
@public_path = real_path(@public_path)

if "#{@public_path}/".start_with?("#{@output_path}/") || "#{@output_path}/".start_with?("#{@public_path}/")
  abort "--output-path must not overlap --public-path: #{@output_path}"
end

# 出力先は毎回空にするため、空でないディレクトリは前回の出力と分かるものに限る
if File.exist?(@output_path) && !(File.directory?(@output_path) &&
                                  (Dir.empty?(@output_path) || previous_output?(@output_path)))
  abort "--output-path must be missing, empty, or a previous output: #{@output_path}"
end

require 'fileutils'
require 'json'

abort "#{@public_path}/index.html not found. run `pnpm build` first" unless File.file?("#{@public_path}/index.html")

begin
  code_lib_data = JSON.parse(File.read("#{@public_path}/data/codelib_full.json", encoding: 'UTF-8'))
rescue JSON::ParserError, SystemCallError => e
  abort "invalid data: #{e.message}"
end

abort 'invalid data: codelib_full.json must be an array' unless code_lib_data.is_a?(Array)

article_paths = code_lib_data.map { |a| a['path'] if a.is_a?(Hash) }
invalid_paths = article_paths.reject { |pa| valid_article_path?(pa) }
abort "invalid article path: #{invalid_paths.inspect}" unless invalid_paths.empty?

# 出力先に触る前に、すべての作成先を検査する
link_paths = article_paths.map { |pa| "#{pa[1..]}.html" }
link_paths.each do |rel|
  dest = File.expand_path(rel, @output_path)
  abort "article path escapes the output directory: #{rel}" unless dest.start_with?("#{@output_path}/")
end
duplicates = link_paths.tally.select { |_, n| n > 1 }.keys
abort "article destination already exists: #{duplicates.inspect}" unless duplicates.empty?
conflicts = link_paths.select { |rel| conflict?(rel, link_paths, @public_path) }
abort "article destination already exists: #{conflicts.inspect}" unless conflicts.empty?

# 冪等にするため、出力先を空にしてから public の中身をそのままコピーする
begin
  FileUtils.mkdir_p @output_path
rescue SystemCallError => e
  abort "--output-path cannot be created: #{e.message}"
end
FileUtils.rm_r(Dir.children(@output_path).map { |c| File.join(@output_path, c) })
FileUtils.cp_r(File.join(@public_path, '.'), @output_path)
Dir.glob('**/*', File::FNM_DOTMATCH, base: @output_path)
   .select { |f| EXCLUDED_BASENAMES.include?(File.basename(f)) }
   .each { |f| FileUtils.rm_f(File.join(@output_path, f)) }

index_path = File.join(@output_path, 'index.html')
link_paths.each do |rel|
  dest = File.join(@output_path, rel)
  FileUtils.mkdir_p File.dirname(dest)
  FileUtils.ln_s relative_path(index_path, dest), dest
end

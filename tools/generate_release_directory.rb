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
  path.is_a?(String) && ARTICLE_PATH_PATTERN.match?(path) &&
    path.split('/').none? { |seg| ['.', '..'].include?(seg) }
end

@output_path = nil
@public_path = "#{__dir__}/../public"

opt = OptionParser.new
opt.on('--output-path /var/www/codeLib2') { |v| @output_path = v }
opt.on('--public-path public') { |v| @public_path = v }
opt.parse!(ARGV)

abort '--output-path is required' if @output_path.nil?

# 末尾の '/' も除かれる
@output_path = File.absolute_path(@output_path)
@public_path = File.absolute_path(@public_path)

# 出力先は毎回空にするため、消してはならない場所を拒否する
if ['/', Dir.home].include?(@output_path) ||
   "#{@public_path}/".start_with?("#{@output_path}/") ||
   "#{@output_path}/".start_with?("#{@public_path}/")
  abort "--output-path must not be / , HOME, or overlap --public-path: #{@output_path}"
end

require 'fileutils'
require 'json'

abort "#{@public_path}/index.html not found. run `pnpm build` first" unless File.file?("#{@public_path}/index.html")

code_lib_data = JSON.parse(File.read("#{@public_path}/data/codelib_full.json"))

article_paths = code_lib_data.map { |a| a['path'] }
invalid_paths = article_paths.reject { |pa| valid_article_path?(pa) }
abort "invalid article path: #{invalid_paths.inspect}" unless invalid_paths.empty?

# 冪等にするため、出力先を空にしてから public の中身をそのままコピーする
FileUtils.mkdir_p @output_path
FileUtils.rm_r(Dir.children(@output_path).map { |c| File.join(@output_path, c) })
FileUtils.cp_r(File.join(@public_path, '.'), @output_path)
Dir.glob('**/*', File::FNM_DOTMATCH, base: @output_path)
   .select { |f| EXCLUDED_BASENAMES.include?(File.basename(f)) }
   .each { |f| FileUtils.rm_f(File.join(@output_path, f)) }

index_path = File.join(@output_path, 'index.html')
article_paths.each do |pa|
  dest = File.expand_path("#{pa[1..]}.html", @output_path)
  abort "article path escapes the output directory: #{pa}" unless dest.start_with?("#{@output_path}/")

  FileUtils.mkdir_p File.dirname(dest)
  FileUtils.ln_s relative_path(index_path, dest), dest
end

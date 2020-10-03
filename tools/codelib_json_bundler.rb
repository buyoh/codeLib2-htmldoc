#!/usr/bin/env ruby

require 'optparse'

def validate_path(path)
  path = path[0..-2] if path[-1] == '/'
  File.absolute_path(path)
end

@codelib_path = nil
@output_path = 'public/data'
@minimize = false

opt = OptionParser.new
opt.on('--codelib-path path/to/codelib') { |v| @codelib_path = v }
opt.on('--output-path public/data') { |v| @output_path = v }
opt.on('--minimize') { |_v| @minimize = true }
opt.parse!(ARGV)

if @codelib_path.nil?
  warn '--codelib-path is required'
  exit 1
end

@codelib_path = validate_path(@codelib_path)
@output_path = validate_path(@output_path)

unless Dir.exist?(@codelib_path + '/tools') && Dir.exist?(@codelib_path + '/src')
  warn '--codelib-path is not codeLib2 path'
  exit 1
end

unless Dir.exist?(@output_path)
  warn '--output-path does not exist'
  exit 1
end

require 'json'
require 'pathname'
require @codelib_path + '/tools/collector/collector.rb'
require @codelib_path + '/tools/collector/gitlog.rb'

docs = Document.collect_documents(@codelib_path)
files = docs.map { |doc| doc[:path] }
# path2commit = GitLog.collect_all_latest_nocache(files, 8, @codelib_path)

docs.map! do |article|
  article[:words] = (article[:words] || '').split(',')
  absolte_path = article[:path]
  if article[:path]
    article[:path] = '/' + Pathname.new(File.absolute_path(article[:path])).relative_path_from(@codelib_path).to_s
  end
  # たぶん、改行区切り
  article[:verified] = (article[:verified] || '').split("\n")
  article[:references] = (article[:references] || '').split("\n")

  article[:commits] = GitLog.history(absolte_path, { n: 99 }, @codelib_path)

  article
end

if @minimize
  IO.write @output_path + '/codelib_full.json', JSON.generate(docs)
else
  IO.write @output_path + '/codelib_full.json', JSON.pretty_generate(docs)
end

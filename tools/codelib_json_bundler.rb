#!/usr/bin/env ruby

require 'optparse'

def validate_path(path)
  path = path[0..-2] if path[-1] == '/'
  File.absolute_path(path)
end

@codelib_path = nil
@output_path = __dir__ + '/../public/data'
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
require @codelib_path + '/tools/lib/collector/collection.rb'
require @codelib_path + '/tools/lib/collector/gitlog.rb'

collection = Collection.new(@codelib_path)
output_docs = collection.src_docs.map do |article|
  path = article[:path]
  absolte_path = File.absolute_path(@codelib_path + '/' + article[:path])
  relation = collection.src_relations[path]
  {
    title: article[:title],
    overview: article[:overview],
    code: article[:code],
    path: '/' + article[:path],
    require: article[:require] || '',
    references: (article[:references] || '').split("\n"),
    words: (article[:words] || '').split(','),
    verified: (article[:verified] || '').split("\n"),
    commits: GitLog.history(absolte_path, { n: 99 }, @codelib_path),
    tested_by: relation ? relation[:tested_by] : []
  }
end

# TODO: top page contents e.g. coverage
# summary = {}

if @minimize
  IO.write @output_path + '/codelib_full.json', JSON.generate(output_docs)
else
  IO.write @output_path + '/codelib_full.json', JSON.pretty_generate(output_docs)
end

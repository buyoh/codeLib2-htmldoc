#!/usr/bin/env ruby

require 'optparse'
require 'pathname'

def validate_path(path)
  path = path[0..-2] if path[-1] == '/'
  File.absolute_path(path)
end

def relative_path(path, base)
  Pathname.new(File.absolute_path(path)).relative_path_from(File.dirname(File.absolute_path(base))).to_s
end

@output_path = nil
@public_path = 'public'
@minimize = false

opt = OptionParser.new
opt.on('--output-path /var/www/codeLib2') { |v| @output_path = v }
opt.on('--public-path public') { |v| @public_path = v }
opt.on('--minimize') { |_v| @minimize = true }
opt.parse!(ARGV)

if @output_path.nil?
  warn '--output-path is required'
  exit 1
end

@output_path = validate_path(@output_path)
@public_path = validate_path(@public_path)

require 'fileutils'
require 'json'

code_lib_data = JSON.parse(IO.read(@public_path + '/data/codelib_full.json'))

FileUtils.mkdir_p @output_path
FileUtils.cp_r Dir.glob(@public_path + '/**/*'), @output_path

Dir.chdir @output_path do
  code_lib_data.map { |a| a['path'][1..-1] + '.html'}.each do |pa|
    FileUtils.mkdir_p File.dirname(pa)
    FileUtils.ln_s relative_path('index.html', pa), pa unless File.exist? pa
  end
end

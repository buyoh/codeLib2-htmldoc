#!/usr/bin/env ruby

require 'optparse'

def validate_path(path)
  path = path[0..-2] if path[-1] == '/'
  File.absolute_path(path)
end

@codelib_path = nil
@output_path = __dir__ + '/../public/data'

argv = ARGV.clone
opt = OptionParser.new
opt.on('--codelib-path path/to/codelib') { |v| @codelib_path = v }
opt.on('--output-path public/data') { |v|  } # TODO: REMOVE
opt.on('--minimize') { |_v|  } # TODO: REMOVE
opt.parse(ARGV)

if @codelib_path.nil?
  warn '--codelib-path is required'
  exit 1
end

argv = ["#{@codelib_path}/tools/json_bundler.rb"] + argv

exec 'ruby', *argv

require 'rubygems'
require 'rake'
require 'net/http'

desc "Default: run doc"
task :default => :doc

desc "Generate documentation"
task :doc do
  library_path = 'pixel.js'
  
  puts "Generating documentation for #{library_path}"
  sh "docco #{library_path}"
end

desc "Compile library"
task :compile do
  library_path = 'pixel.js'
  output_path = "#{library_path.gsub(/\.js$/, '')}.min.js"
  
  puts "Compiling #{library_path}"
  uri = URI('http://closure-compiler.appspot.com/compile')
  options = {
    'js_code'           => File.open(library_path).read,
    'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
    'output_format'     => 'text',
    'output_info'       => 'compiled_code'
  }
  res = Net::HTTP.post_form(uri, options)
  
  puts "Writing compiled code to #{output_path}"
  File.open(output_path, 'w') {|f| f.write(res.body)}
end
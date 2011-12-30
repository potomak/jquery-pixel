require 'rubygems'
require 'rake'

desc "Default: run doc"
task :default => :doc

desc "Generate documentation"
task :doc do
  puts "Generating documentation..."
  sh '~/node_modules/docco/bin/docco jquery.pixel.js'
  puts "Done"
end
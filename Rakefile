require 'fileutils'
require 'sprockets'
require './source_annotation_extractor'

# Setup Sprockets
environment = Sprockets::Environment.new
environment.append_path 'lib'
environment.append_path 'test'
environment.append_path 'deps'
environment.unregister_postprocessor 'application/javascript', Sprockets::SafetyColons

# Check for the existence of an executable.
def check(exec, name, url)
  return unless `which #{exec}`.empty?
  puts "#{name} not found.\nInstall it from #{url}"
  exit
end

desc "build viking.js and testing files"
task :build do
  FileUtils.mkdir_p('./tmp')
  FileUtils.rm_f('./viking.js')
  FileUtils.rm_f('./tmp/test.js')
  
  File.open('./viking.js', "w") do |file|
    file.write(environment['viking.js'].to_s)
  end

  File.open('./viking.bundled.js', "w") do |file|
    file.write(environment['viking.bundled.js'].to_s)
  end
  
  File.open('./tmp/test.js', "w") do |file|
    file.write(environment['test.js'].to_s)
  end
end

desc "build the docco documentation"
task :doc => :build do
  check 'docco', 'docco', 'https://github.com/jashkenas/docco'
  system 'docco --css docco.css viking.js' #  && docco examples/todos/todos.js examples/backbone.localstorage.js
end

desc "run JavaScriptLint on the source"
task :lint => :build do
  check 'jslint', 'JavaScript Lint', 'npm install jslint --global'
  system "find lib -name '*.js' -exec jslint --color --predef Backbone --predef _ --predef jQuery --predef strftime --predef Viking --browser --plusplus --nomen --white --regex --vars --sloppy '{}' \\\;"
end

desc "Enumerate all annotations (use notes:optimize, :fixme, :todo for focus)"
task :notes do
  SourceAnnotationExtractor.enumerate "OPTIMIZE|FIXME|TODO", tag: true
end

namespace :notes do
  ["OPTIMIZE", "FIXME", "TODO"].each do |annotation|
    # desc "Enumerate all #{annotation} annotations"
    task annotation.downcase.intern do
      SourceAnnotationExtractor.enumerate annotation
    end
  end

  desc "Enumerate a custom annotation, specify with ANNOTATION=CUSTOM"
  task :custom do
    SourceAnnotationExtractor.enumerate ENV['ANNOTATION']
  end
end
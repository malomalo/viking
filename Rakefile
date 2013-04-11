require 'fileutils'
require 'sprockets'

environment = Sprockets::Environment.new
environment.append_path 'lib'
environment.append_path 'test'
environment.append_path 'deps'

desc "build viking.js and testing files"
task :build do
  FileUtils.mkdir_p('./out')
  FileUtils.rm_f('./out/viking.js')
  FileUtils.rm_f('./out/test.js')
  
  File.open('./out/viking.js', "w") do |file|
    file.write(environment['viking.js'].to_s)
  end

  File.open('./out/viking.bundled.js', "w") do |file|
    file.write(environment['viking.bundled.js'].to_s)
  end
  
  File.open('./out/test.js', "w") do |file|
    file.write(environment['test.js'].to_s)
  end
end

desc "build the docco documentation"
task :doc => :build do
  check 'docco', 'docco', 'https://github.com/jashkenas/docco'
  system 'docco out/viking.js' #  && docco examples/todos/todos.js examples/backbone.localstorage.js
end

desc "run JavaScriptLint on the source"
task :lint => :build do
  check 'jsl', 'JavaScript Lint', 'http://www.javascriptlint.com/'
  system "find lib -name '*.js' -exec jsl -nofilelisting -nologo -process '{}' \\\;"
end

# Check for the existence of an executable.
def check(exec, name, url)
  return unless `which #{exec}`.empty?
  puts "#{name} not found.\nInstall it from #{url}"
  exit
end
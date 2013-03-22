require 'fileutils'
require 'sprockets'

environment = Sprockets::Environment.new
environment.append_path 'lib'
environment.append_path 'test'
environment.append_path 'deps'

desc "Build Viking.js and test files"
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

desc "run JavaScriptLint on the source"
task :lint => :build do
  # check 'jsl', 'JavaScript Lint', 'http://www.javascriptlint.com/'
  system "find lib -name '*.js' -exec jsl -nofilelisting -nologo -process '{}' \\\;"
end
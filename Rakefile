require 'fileutils'
require 'sprockets'
require 'erb'
require 'json'
require 'rest_client'
require './source_annotation_extractor'

# Setup Sprockets
environment = Sprockets::Environment.new
environment.append_path 'lib'
environment.append_path 'test'
environment.append_path 'deps'
environment.unregister_postprocessor 'application/javascript', Sprockets::SafetyColons

desc "build viking.js and testing files"
task :build do
  FileUtils.rm_f('./viking.js')
  
  File.open('./viking.js', "w") do |file|
    file.write(environment['viking.js'].to_s)
  end
end

desc "build the docco documentation"
task :doc => :build do
  check 'docco', 'docco', 'https://github.com/jashkenas/docco'
  system 'docco --css docco.css viking.js'
end

desc "run JavaScriptLint on the source"
task :lint do
  check 'jslint', 'JavaScript Lint', 'npm install jslint --global'
  system "find lib -name '*.js' -exec jslint --color --predef Backbone --predef _ --predef jQuery --predef strftime --predef Viking --browser --plusplus --nomen --white --regex --vars --sloppy '{}' \\\;"
end

desc "Enumerate all annotations (use notes:optimize, :fixme, :todo for focus)"
task :notes do
  SourceAnnotationExtractor.enumerate "OPTIMIZE|FIXME|TODO", tag: true
end

task :test do
  # Checks
  check 'npm', 'npm', 'http://nodejs.org/'
  check 'jscoverage', 'jscoverage', 'http://siliconforks.com/jscoverage/'

  # Add our custom Processor to turn viking.js into a list of files to include
  environment.unregister_postprocessor 'application/javascript', Sprockets::DirectiveProcessor
  environment.register_postprocessor 'application/javascript', UrlGenerator  
  
  viking_files = environment['viking.js'].to_s.lines.map do |l|
    l.sub(Dir.pwd, '').strip
  end
  
  test_files = environment['test.js'].to_s.lines.map do |l|
    l.sub(Dir.pwd, '').strip
  end
  
  # Render the test html file
  File.open('test/index.html', 'w') do |file|
    file.write(ERB.new(File.read('test/index.html.erb')).result(binding))
  end
  
  pid = spawn('jscoverage-server --port=4321 --verbose --report-dir=coverage --no-highlight --no-instrument=/deps/ --no-instrument=/test/ --no-instrument=/coverage/')
  result = system "npm test"
  Process.kill(:SIGKILL, pid)
  fail unless result
end

namespace :coveralls do
  task :push do
    
    payload = {
      :service_name => 'semaphore',
      :repo_token => ENV['COVERALLS_REPO_TOKEN'],
      :service_job_id => ENV['SEMAPHORE_BUILD_NUMBER'],
      :source_files => []
    }
    data = JSON.parse(File.read('coverage/jscoverage.json'))
    
    data.each do |k, v|
      v['coverage'].shift
      payload[:source_files] << {
        :name => k,
        :coverage => v['coverage'],
        :source => v['source'].join("\n")
      }
    end
    
    file = Tempfile.new(['upload','json'])
    file.write(payload.to_json)
    file.rewind
    RestClient.post("https://coveralls.io/api/v1/jobs", :json_file => file)
    file.close(true)
  end
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

class UrlGenerator < Sprockets::DirectiveProcessor
  protected
    def process_source
      @result << @pathname.to_s << "\n" unless @has_written_body
    end
end

# Check for the existence of an executable.
def check(exec, name, url)
  return unless `which #{exec}`.empty?
  puts "#{name} not found.\nInstall it from #{url}"
  exit(1)
end
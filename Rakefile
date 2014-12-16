require 'fileutils'
require 'sprockets'
require 'erb'
require 'json'
require 'rest_client'
require './test/source_annotation_extractor'
require 'rake/clean'

# Setup Sprockets
environment = Sprockets::Environment.new
environment.append_path 'lib'
environment.append_path 'test'
environment.append_path 'dependencies'
environment.append_path 'test/dependencies'
environment.unregister_postprocessor 'application/javascript', Sprockets::SafetyColons

desc "Compile viking.js"
file "viking.js" => FileList["lib/**/*.js"] do
  FileUtils.rm_f('./viking.js')

  File.open('./viking.js', "w") do |file|
    file.write(environment['viking.js'].to_s)
  end
end

desc "Compile viking.js"
task :compile => ["viking.js"]

CLEAN.include("test/coverage")
CLOBBER.include("viking.js")

desc "Build the docco documentation"
task :doc => "viking.js" do
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

task :test => 'test:browser'

namespace :test do

  desc "Run the test in your browswer"
  task :browser do
    # Add our custom Processor to turn viking.js into a list of files to include
    environment.unregister_postprocessor 'application/javascript', Sprockets::DirectiveProcessor
    environment.register_postprocessor 'application/javascript', LocalUrlGenerator

    # Render the test html files
    File.open('test/index.html', 'w') do |file|
      file.write(ERB.new(File.read('test/index.html.erb')).result(binding))
    end
    File.open('test/ie8.html', 'w') do |file|
      file.write(ERB.new(File.read('test/ie8.html.erb')).result(binding))
    end

    system("open test/index.html")
  end

  desc "Run the test in a headless browswer and report coverage"
  task :headless do
    # Checks
    check 'npm', 'npm', 'http://nodejs.org/'
    #check 'jscover', 'jscover', 'http://tntim96.github.io/JSCover/'
    #
    # Installation for jscover:
    # mkdir -p jscover
    # wget --trust-server-name --output-document=jscover/jscover.zip "http://downloads.sourceforge.net/project/jscover/JSCover-1.0.6.zip?r=http%3A%2F%2Ftntim96.github.io%2FJSCover%2F&ts=1366915691&use_mirror=hivelocity"
    # unzip -d jscover/jscover jscover/jscover.zip
    # mv jscover/jscover/target/dist/JSCover-all.jar /usr/local/lib/jscover-all.jar
    # rm -rf jscover

    # Add our custom Processor to turn viking.js into a list of files to include
    environment.unregister_postprocessor 'application/javascript', Sprockets::DirectiveProcessor
    environment.register_postprocessor 'application/javascript', UrlGenerator

    # Render the test html files
    File.open('test/index.html', 'w') do |file|
      file.write(ERB.new(File.read('test/index.html.erb')).result(binding))
    end
    File.open('test/ie8.html', 'w') do |file|
      file.write(ERB.new(File.read('test/ie8.html.erb')).result(binding))
    end

    FileUtils.rm_rf('test/coverage')
    pid = spawn('java -jar /usr/local/lib/jscover-all.jar -ws --port=4321 --report-dir=test/coverage --no-instrument=/deps/ --no-instrument=/test/')
    result = system "npm test"
    Process.kill(:SIGINT, pid)

    fail unless result
  end
end

namespace :coveralls do
  task :push do
    
    payload = {
      :service_name => 'semaphore',
      :repo_token => ENV['COVERALLS_REPO_TOKEN'],
      :service_job_id => ENV['CIRCLE_BUILD_NUM'],
      :source_files => [],
      :git => git_info
    }
    data = JSON.parse(File.read('test/coverage/jscoverage.json'))
    
    data.each do |k, v|
      v['lineData'].shift
      payload[:source_files] << {
        :name => k,
        :coverage => v['lineData'],
        :source => File.read(".#{k}")
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

class LocalUrlGenerator < Sprockets::DirectiveProcessor
  protected
    def process_source
      lib_file = File.expand_path("../#{@pathname.to_s.gsub('test/','lib/')}", __FILE__)
      test_file = File.expand_path("../#{@pathname}", __FILE__)

      @result << (File.exists?(lib_file) ? lib_file : test_file) << "\n" unless @has_written_body
    end
end

# Check for the existence of an executable.
def check(exec, name, url)
  return unless `which #{exec}`.empty?
  puts "#{name} not found.\nInstall it from #{url}"
  exit(1)
end

def git_info
  hash = {}
  
  hash[:head] = {
    :id => `git log -1 --pretty=format:'%H'`,
    :author_name => `git log -1 --pretty=format:'%aN'`,
    :author_email => `git log -1 --pretty=format:'%ae'`,
    :committer_name => `git log -1 --pretty=format:'%cN'`,
    :committer_email => `git log -1 --pretty=format:'%ce'`,
    :message => `git log -1 --pretty=format:'%s'`
  }

  # Branch
  branch = `git branch`.split("\n").delete_if { |i| i[0] != "*" }
  hash[:branch] = [branch].flatten.first.gsub("* ","")

  # Remotes
  remotes = nil
  begin
    remotes = `git remote -v`.split(/\n/).map do |remote|
      splits = remote.split(" ").compact
      {:name => splits[0], :url => splits[1]}
    end.uniq
  rescue
  end
  hash[:remotes] = remotes
  
  hash
end

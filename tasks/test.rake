require File.join(File.expand_path("../../", __FILE__), 'ext', 'sprockets/processors')

desc "Alias for test:browser"
task :test => 'test:browser'

namespace :test do

  # Add our custom Processor to turn viking.js into a list of files to include
  task :local_urls do
    asset_pipeline.unregister_bundle_processor 'application/javascript', Sprockets::Bundle
    asset_pipeline.register_bundle_processor  'application/javascript', LocalUrlGenerator
  end

  # Add our custom Processor to turn viking.js into a list of files to include
  task :jscover_urls do
    asset_pipeline.unregister_bundle_processor 'application/javascript', Sprockets::Bundle
    asset_pipeline.register_bundle_processor  'application/javascript', JSCoverUrlGenerator
  end
  
  # Render the test html files
  task :render do
    ['test/index.html', 'test/ie8.html'].each do |filename|
      File.open(filename, 'w') do |file|
        file.write(ERB.new(File.read("#{filename}.erb")).result(binding))
      end
    end
  end
  
  desc "Run the test in your browswer"
  task :browser => [:local_urls, :render] do
    system("open test/index.html")
  end

  desc "Run the test in a headless browswer and report coverage"
  task :headless => [:local_urls, :render] do
    check 'phantomjs', 'PhantomJS', 'http://phantomjs.org/'

    fail unless system("phantomjs test/runner.js test/index.html")
  end
  
  task :coverage => [:jscover_urls, :render] do
    check 'phantomjs', 'PhantomJS', 'http://phantomjs.org/', 'brew install phantomjs'
    if !File.exists?('/usr/local/lib/JSCover-all.jar')
      check 'jscover', 'JSCover', 'http://tntim96.github.io/JSCover/', <<-DOC
      curl -O 'https://drone.io/github.com/tntim96/JSCover/files/target/dist/JSCover-all.jar'
      mv JSCover-all.jar /usr/local/lib/JSCover-all.jar
      DOC
    end

    FileUtils.rm_rf('test/coverage')
    pid = spawn('java -jar /usr/local/lib/JSCover-all.jar -ws --port=4321 --report-dir=test/coverage --no-instrument=/test/')
    sleep(1) # sometimes java hasn't bound to the soket yet on circleci
    result = system("phantomjs test/runner.js http://127.0.0.1:4321/test/index.html")
    Process.kill(:SIGINT, pid)

    fail unless result
  end
  
end

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
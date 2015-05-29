class LocalUrlGenerator < Sprockets::Bundle
  def self.call(input)
    env  = input[:environment]
    type = input[:content_type]
    dependencies = Set.new(input[:metadata][:dependencies])
    
    processed_uri, deps = env.resolve(input[:filename], accept: type, pipeline: :self, compat: false)
    dependencies.merge(deps)

    find_required = proc { |uri| env.load(uri).metadata[:required] }
    required = Sprockets::Utils.dfs(processed_uri, &find_required)
    stubbed  = Sprockets::Utils.dfs(env.load(processed_uri).metadata[:stubbed], &find_required)
    required.subtract(stubbed)
    assets = required.map { |uri| env.load(uri) }

    (required + stubbed).each do |uri|
      dependencies.merge(env.load(uri).metadata[:dependencies])
    end

    assets.map(&:filename).map{|n| "..#{n}"}.join("\n")
  end
end

class JSCoverUrlGenerator < Sprockets::Bundle
  def self.call(input)
    env  = input[:environment]
    type = input[:content_type]
    dependencies = Set.new(input[:metadata][:dependencies])
    
    processed_uri, deps = env.resolve(input[:filename], accept: type, pipeline: :self, compat: false)
    dependencies.merge(deps)

    find_required = proc { |uri| env.load(uri).metadata[:required] }
    required = Sprockets::Utils.dfs(processed_uri, &find_required)
    stubbed  = Sprockets::Utils.dfs(env.load(processed_uri).metadata[:stubbed], &find_required)
    required.subtract(stubbed)
    assets = required.map { |uri| env.load(uri) }

    (required + stubbed).each do |uri|
      dependencies.merge(env.load(uri).metadata[:dependencies])
    end

    assets.map(&:filename).map{|n| "http://127.0.0.1:4321#{n}"}.join("\n")
  end
end
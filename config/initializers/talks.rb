require "pathname"

talk_data_path = ENV.fetch("IGNITEVIEW_TALK_DATA_PATH") do
  abort "Need to specify IGNITEVIEW_TALK_DATA_PATH"
end

talk_data_path = Pathname(talk_data_path)

unless talk_data_path.exist?
  raise "Cannot find talk data path '#{talk_data_path}'"
end

Rails.application.config.x.talk_path = talk_data_path.dirname
Rails.application.config.x.talk_data = talk_data_path.read
Rails.application.config.x.talks = JSON.parse(talk_data_path.read).fetch("talks").map do |talk|
  OpenStruct.new(talk.symbolize_keys!)
end

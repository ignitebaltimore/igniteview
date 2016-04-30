class PresentationsController < ApplicationController
  helper_method :talk_data, :talks

  def index
    @talk_data = Rails.configuration.x.talk_data
    @talks = Rails.configuration.x.talks
  end

  # @note
  #   This is obviously super dangerous to run on the Internet;
  #   this code is intended for local use only
  def files
    path = Rails.configuration.x.talk_path.join(params.require(:talk_path))

    unless path.exist?
      msg = "'#{path}' does not exist"
      logger.error msg
      render :text => msg, :status => :server_error
      return
    end

    logger.info "Sending #{path}..."
    send_file(path)
  end

  private

  attr_reader :title, :talk_data, :intermission_after_talk_number, :talks
end

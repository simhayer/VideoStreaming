# class WebRtcChannel < ApplicationCable::Channel
#   def subscribed
#     # stream_from "some_channel"
#     stream_from "web_rtc_#{params[:channel_id]}"
#   end

#   def unsubscribed
#     # Any cleanup needed when channel is unsubscribed
#   end

#   def receive(data)
#     # Handle data received from the client (ice candidates, offers, answers, etc.)
#     ActionCable.server.broadcast("web_rtc_#{params[:channel_id]}", data)
#   end
# end


# app/channels/webrtc_channel.rb

# app/channels/webrtc_channel.rb

class WebrtcChannel < ApplicationCable::Channel
  def subscribed
    stream_from "webrtc_channel_#{params[:userId]}"
    puts "stream_from webrtc_channel_#{params[:userId]}"
  end

  def receive(data)
    begin
      puts "here"
      parsed_data = JSON.parse(data)

      case parsed_data['type']
      when 'register'
        clients[parsed_data['userId']] = current_user
        puts "#{parsed_data['userId']} registered"
      when 'newCall'
        # Handle new call logic
        # Example: You might want to broadcast the new call to the relevant channel
        ActionCable.server.broadcast("channel_#{data['otherUserId']}", rtcMessage: data['rtcMessage'])
      else
        ActionCable.server.broadcast("webrtc_channel_#{parsed_data['otherUserId']}", parsed_data.to_json)
      end
    rescue JSON::ParserError => e
      puts e.message
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  private

  def clients
    @@clients ||= {}
  end

  def current_user
    # Implement your logic to get the current user based on the WebSocket connection
    # For example, you might have a User model and use the connection's user_id
    # Assuming you have a User model with an 'id' attribute
    User.find(params[:userId])
  end
end

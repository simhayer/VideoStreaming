Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  # get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
  namespace :api do

    namespace :auth do
      post 'login', action: :login, controller: :auth
      post 'logout', action: :logout, controller: :auth
      post 'forgetCode', action: :forgetCode, controller: :auth
      post 'forgetCodeCheck', action: :forgetCodeCheck, controller: :auth
    end

    namespace :v1 do
      get 'get_users', action: :getUsers, controller: :users
      post 'add_user', action: :addUser, controller: :users
      get 'show_user', action: :showUser, controller: :users
      put 'updateUser', action: :updateUser, controller: :users
      delete 'delete_user', action: :deleteUser, controller: :users
    end
  end
end

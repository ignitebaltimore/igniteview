Rails.application.routes.draw do
  root to: "presentations#index"
  resources :presentations, only: %i(index show)
end

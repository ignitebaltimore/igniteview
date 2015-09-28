Rails.application.routes.draw do
  root to: "presentations#index"

  resources :presentations, only: %i(index) do
    collection do
      get "files"
    end
  end
end

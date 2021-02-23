defmodule Bulls2Web.PageController do
  use Bulls2Web, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end

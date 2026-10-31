import "@typespec/http";

using TypeSpec.Http;

@service(#{ title: "Call Calendar" })
@server("http://localhost:8000", "Local development")
namespace CallCalendar;

model Health {
  status: "ok";
}

@route("/health")
interface Status {
  @get check(): Health;
}

package edu.brown.cs.student.main.server;

import static spark.Spark.before;
import static spark.Spark.options;

import edu.brown.cs.student.main.server.datasource.DefaultDataSource;
import edu.brown.cs.student.main.server.datasource.GeoDataSource;
import edu.brown.cs.student.main.server.datasource.cache.CacheDataSource;
import edu.brown.cs.student.main.server.handlers.GetDormPointsHandler;
import edu.brown.cs.student.main.server.handlers.GetProfileHandler;
import edu.brown.cs.student.main.server.handlers.GetUserPointsHandler;
import edu.brown.cs.student.main.server.handlers.SaveProfileHandler;
import edu.brown.cs.student.main.server.handlers.UpdatePointsHandler;
import edu.brown.cs.student.main.server.parser.GeoJsonObject;
import edu.brown.cs.student.main.server.parser.JSONParser2;
import edu.brown.cs.student.main.server.storage.FirebaseUtilities;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.io.IOException;
import spark.Spark;

/** Top Level class for our project, utilizes spark to create and maintain our server. */
public class Server {

  public static void setUpServer() {
    int port = 3232;
    Spark.port(port);

    // Apply CORS headers for all requests including preflight
    before(
        (request, response) -> {
          response.header("Access-Control-Allow-Origin", "*");
          response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
          response.header(
              "Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        });

    options(
        "/*",
        (request, response) -> {
          response.status(200);
          return "OK";
        });

    StorageInterface firebaseUtils;
    try {
      firebaseUtils = new FirebaseUtilities();

      Spark.post("get-profile", new GetProfileHandler(firebaseUtils));
      Spark.post("save-profile", new SaveProfileHandler(firebaseUtils));

      // New endpoints for points system
      Spark.post("update-points", new UpdatePointsHandler(firebaseUtils));
      Spark.post("get-user-points", new GetUserPointsHandler(firebaseUtils));
      Spark.post("get-dorm-points", new GetDormPointsHandler(firebaseUtils));

      String workingDirectory = System.getProperty("user.dir");

      Spark.notFound(
          (request, response) -> {
            response.status(404); // Not Found
            System.out.println("ERROR");
            return "404 Not Found - The requested endpoint does not exist.";
          });

      JSONParser2 parser = new JSONParser2();
      parser.createGeoJson();
      GeoJsonObject geoData = parser.parsedJSON;

      GeoDataSource defaulDataSource = new DefaultDataSource(geoData);
      GeoDataSource cacheDataSource = new CacheDataSource(defaulDataSource, 10);

      Spark.init();
      Spark.awaitInitialization();

      System.out.println("Server started at http://localhost:" + port);
    } catch (IOException e) {
      e.printStackTrace();
      System.err.println(
          "Error: Could not initialize Firebase. Likely due to firebase_config.json not being found. Exiting.");
      System.exit(1);
    }

    Spark.get(
        "/api/track/:trackId",
        (request, response) -> {
          String trackId = request.params(":trackId");
          try {
            java.net.URL url = new java.net.URL("https://api.deezer.com/track/" + trackId);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            java.io.BufferedReader reader =
                new java.io.BufferedReader(new java.io.InputStreamReader(conn.getInputStream()));
            StringBuilder result = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
              result.append(line);
            }
            reader.close();

            response.type("application/json");
            System.out.println("Deezer response: " + result);
            return result.toString();

          } catch (Exception e) {
            response.status(500);
            return "{\"error\": \"Could not fetch preview from Deezer.\"}";
          }
        });
  }

  /**
   * Runs Server.
   *
   * @param args none
   */
  public static void main(String[] args) {
    setUpServer();
  }
}

package edu.brown.cs.student.main.server;

import static spark.Spark.before;
import static spark.Spark.options;

import edu.brown.cs.student.main.server.datasource.DefaultDataSource;
import edu.brown.cs.student.main.server.datasource.GeoDataSource;
import edu.brown.cs.student.main.server.datasource.cache.CacheDataSource;
import edu.brown.cs.student.main.server.handlers.AddPinHandler;
import edu.brown.cs.student.main.server.handlers.AddWordHandler;
import edu.brown.cs.student.main.server.handlers.ClearPinsHandler;
import edu.brown.cs.student.main.server.handlers.ClearUserHandler;
import edu.brown.cs.student.main.server.handlers.GetProfileHandler;
import edu.brown.cs.student.main.server.handlers.ListPinsHandler;
import edu.brown.cs.student.main.server.handlers.ListWordsHandler;
import edu.brown.cs.student.main.server.handlers.RedLiningHandler;
import edu.brown.cs.student.main.server.handlers.SaveProfileHandler;
import edu.brown.cs.student.main.server.handlers.SearchAreasHandler;
import edu.brown.cs.student.main.server.handlers.leaderboardDormHandler;
import edu.brown.cs.student.main.server.handlers.leaderboardGlobalHandler;
import edu.brown.cs.student.main.server.parser.GeoJsonObject;
import edu.brown.cs.student.main.server.parser.JSONParser2;
import edu.brown.cs.student.main.server.storage.FirebaseUtilities;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.io.IOException;
import java.nio.file.Paths;
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

      Spark.get("leaderboard/global", new leaderboardGlobalHandler(firebaseUtils));
      Spark.get("leaderboard/dorm/:dormId", new leaderboardDormHandler(firebaseUtils));

      Spark.get("add-pin", new AddPinHandler(firebaseUtils));
      Spark.get("list-pins", new ListPinsHandler(firebaseUtils));
      Spark.get("clear-pins", new ClearPinsHandler(firebaseUtils));

      Spark.get("add-word", new AddWordHandler(firebaseUtils));
      Spark.get("list-words", new ListWordsHandler(firebaseUtils));
      Spark.get("clear-user", new ClearUserHandler(firebaseUtils));

      String workingDirectory = System.getProperty("user.dir");
      String geoJsonPath =
          Paths.get(workingDirectory, "src", "main", "resources", "fullDownload.json").toString();
      Spark.get("search-areas", new SearchAreasHandler(geoJsonPath));

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

      Spark.get("/redlining", new RedLiningHandler(cacheDataSource));

      Spark.init();
      Spark.awaitInitialization();

      System.out.println("Server started at http://localhost:" + port);
    } catch (IOException e) {
      e.printStackTrace();
      System.err.println(
          "Error: Could not initialize Firebase. Likely due to firebase_config.json not being found. Exiting.");
      System.exit(1);
    }
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

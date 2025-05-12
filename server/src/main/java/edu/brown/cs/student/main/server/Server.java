package edu.brown.cs.student.main.server;

import static spark.Spark.after;

import edu.brown.cs.student.main.server.datasource.DefaultDataSource;
import edu.brown.cs.student.main.server.datasource.GeoDataSource;
import edu.brown.cs.student.main.server.datasource.cache.CacheDataSource;
import edu.brown.cs.student.main.server.handlers.AddPinHandler;
import edu.brown.cs.student.main.server.handlers.AddPointsHandler;
import edu.brown.cs.student.main.server.handlers.AddWordHandler;
import edu.brown.cs.student.main.server.handlers.ClearPinsHandler;
import edu.brown.cs.student.main.server.handlers.ClearUserHandler;
import edu.brown.cs.student.main.server.handlers.GetUserStatsHandler;
import edu.brown.cs.student.main.server.handlers.ListPinsHandler;
import edu.brown.cs.student.main.server.handlers.ListWordsHandler;
import edu.brown.cs.student.main.server.handlers.RedLiningHandler;
import edu.brown.cs.student.main.server.handlers.SearchAreasHandler;
import edu.brown.cs.student.main.server.handlers.SetCategoryHandler;
import edu.brown.cs.student.main.server.parser.GeoJsonObject;
import edu.brown.cs.student.main.server.parser.JSONParser2;
import edu.brown.cs.student.main.server.storage.FirebaseUtilities;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.io.IOException;
import java.nio.file.Paths;
import spark.Filter;
import spark.Spark;

/** Top Level class for our project, utilizes spark to create and maintain our server. */
public class Server {

  public static void setUpServer() {
    int port = 3232;
    Spark.port(port);

    after(
        (Filter)
            (request, response) -> {
              response.header("Access-Control-Allow-Origin", "*");
              response.header("Access-Control-Allow-Methods", "*");
            });

    StorageInterface firebaseUtils;
    try {
      firebaseUtils = new FirebaseUtilities();

      // Pin handlers
      Spark.get("add-pin", new AddPinHandler(firebaseUtils));
      Spark.get("list-pins", new ListPinsHandler(firebaseUtils));
      Spark.get("clear-pins", new ClearPinsHandler(firebaseUtils));

      // Word handlers for song game
      Spark.get("add-word", new AddWordHandler(firebaseUtils));
      Spark.get("list-words", new ListWordsHandler(firebaseUtils));
      Spark.get("clear-user", new ClearUserHandler(firebaseUtils));

      // New handlers for points and categories
      Spark.get("add-points", new AddPointsHandler(firebaseUtils));
      Spark.get("get-user-stats", new GetUserStatsHandler(firebaseUtils));
      Spark.get("set-category", new SetCategoryHandler(firebaseUtils));

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

package edu.brown.cs.student.main.server.handlers;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import edu.brown.cs.student.main.server.storage.StorageInterface;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import spark.Request;
import spark.Response;
import spark.Route;

public class DormStatsHandler implements Route {

  private final StorageInterface storageHandler;

  public DormStatsHandler(StorageInterface storageHandler) {
    this.storageHandler = storageHandler;
  }

  @Override
  public Object handle(Request request, Response response) {
    Map<String, Object> responseMap = new HashMap<>();

    try {
      Firestore db = FirestoreClient.getFirestore();

      CollectionReference dormsRef = db.collection("dorms");
      QuerySnapshot dormsQuery = dormsRef.get().get();
      List<Map<String, Object>> dormStats = new ArrayList<>();

      // -- for every dorm, gather statistics
      for (QueryDocumentSnapshot dormDoc : dormsQuery.getDocuments()) {
        String dormName = dormDoc.getId();
        Map<String, Object> dormData = dormDoc.getData();

        int totalPoints = 0;
        String topGenre = null;
        int topGenrePoints = 0;

        for (Map.Entry<String, Object> entry : dormData.entrySet()) {
          String genre = entry.getKey();
          int points = 0;

          if (entry.getValue() instanceof Long) {
            points = ((Long) entry.getValue()).intValue();
          } else if (entry.getValue() instanceof Integer) {
            points = (Integer) entry.getValue();
          }

          totalPoints += points;

          // -- check if this is the top genre
          if (points > topGenrePoints) {
            topGenrePoints = points;
            topGenre = genre;
          }
        }

        Map<String, Object> dormStats1 = new HashMap<>();
        dormStats1.put("name", dormName);
        dormStats1.put("totalPoints", totalPoints);
        dormStats1.put("topGenre", topGenre);
        dormStats1.put("topGenrePoints", topGenrePoints);

        // coords based on dorm name
        Map<String, Double> coordinates = getDormCoordinates(dormName);
        dormStats1.put("latitude", coordinates.get("lat"));
        dormStats1.put("longitude", coordinates.get("lng"));

        // radius based on total points (for visualization)
        double baseRadius = 50; // base radius in meters
        double maxRadius = 500; // maximum radius in meters
        double scaleFactor = 0.1; // how much to scale by points
        double radius = Math.min(baseRadius + (totalPoints * scaleFactor), maxRadius);
        dormStats1.put("radius", radius);

        dormStats.add(dormStats1);
      }

      responseMap.put("response_type", "success");
      responseMap.put("dormStats", dormStats);

    } catch (Exception e) {
      e.printStackTrace();
      responseMap.put("response_type", "failure");
      responseMap.put("error", e.getMessage());
    }

    return Utils.toMoshiJson(responseMap);
  }

  private Map<String, Double> getDormCoordinates(String dormName) {
    // -- base coordinates for Brown
    //    double baseLat = 41.826;
    //    double baseLng = -71.403;

    Map<String, double[]> realDormCoords = new HashMap<>();

    // -- HELP ME -- THANK YOU
    realDormCoords.put("Andrews", new double[] {41.830649743962645, -71.40252899458987});
    realDormCoords.put("Barbour", new double[] {41.82395836603943, -71.39806830313665});
    realDormCoords.put("Buxton", new double[] {41.82459468101797, -71.4023761182794});
    realDormCoords.put("Caswell", new double[] {41.82657138925035, -71.40071913627008});
    //    realDormCoords.put("Chapman", new double[] {41.827379, -71.400998});
    realDormCoords.put("Chen", new double[] {41.82365634319742, -71.3990281420393});
    realDormCoords.put("Danoff", new double[] {41.82386268239851, -71.39857199225345});
    //    realDormCoords.put("Dinman", new double[] {41.826150, -71.403310});
    realDormCoords.put("Em-Wool", new double[] {41.829647974696705, -71.401453493725});
    realDormCoords.put("Goddard", new double[] {41.82414195870962, -71.40120841247712});
    realDormCoords.put("Grad", new double[] {41.82343759279173, -71.40070255217438});
    realDormCoords.put("Harambee", new double[] {41.83099475520322, -71.40095364924821});
    realDormCoords.put("Harkness", new double[] {41.82404473850165, -71.40073954921027});
    realDormCoords.put("Hegeman", new double[] {41.82571253515899, -71.40082643216698});
    //    realDormCoords.put("Hope", new double[] {41.828593, -71.402133});
    realDormCoords.put("Keeney", new double[] {41.82422979920377, -71.40337115274653});
    realDormCoords.put("Littlefield", new double[] {41.825635868072084, -71.40203508223448});
    realDormCoords.put("Machado", new double[] {41.83011558610658, -71.4050143388379});
    realDormCoords.put("Marcy", new double[] {41.82473730233642, -71.4012707731751});
    realDormCoords.put("Metcalf", new double[] {41.83015617377386, -71.40272181777311});
    realDormCoords.put("Miller", new double[] {41.83023688752851, -71.40221235078705});
    realDormCoords.put("Minden", new double[] {41.827519882095835, -71.39890448788373});
    realDormCoords.put("Mo-Champ", new double[] {41.83008992213152, -71.40177199832927});
    realDormCoords.put("New Pem", new double[] {41.83059142610096, -71.40117254982653});
    realDormCoords.put("Olney", new double[] {41.82460014392958, -71.40196459970396});
    realDormCoords.put("Perkins", new double[] {41.82362719166075, -71.39617367031963});
    realDormCoords.put("Sears", new double[] {41.825327865151294, -71.40168131463952});
    realDormCoords.put("Slater", new double[] {41.82582442223982, -71.40382557402646});
    realDormCoords.put("Wayland", new double[] {41.82496299151876, -71.40246073560259});
    realDormCoords.put("Wellness", new double[] {41.82997199108344, -71.39991930261249});
    //    realDormCoords.put("West", new double[] {41.824150, -71.406130});
    realDormCoords.put("Young O", new double[] {41.824136135640494, -71.39636153838302});
    realDormCoords.put("111 Brown St", new double[] {41.83031346800189, -71.40334821856591});
    realDormCoords.put("219 Bowen St", new double[] {41.830958409501214, -71.40163411487178});

    //    // -- for any dorm unlisted above, just place it randomly for testing
    //    double[] offset;
    //    if (dormOffsets.containsKey(dormName)) {
    //      offset = dormOffsets.get(dormName);
    //    } else {
    //      int hashCode = dormName.hashCode();
    //      double latOffset = (hashCode % 100) / 10000.0;
    //      double lngOffset = ((hashCode / 100) % 100) / 10000.0;
    //      offset = new double[] {latOffset, lngOffset};
    //    }

    // center of campus
    double[] coords = realDormCoords.getOrDefault(dormName, new double[] {41.826, -71.403});

    //    Map<String, Double> coordinates = new HashMap<>();
    //    coordinates.put("lat", baseLat + offset[0]);
    //    coordinates.put("lng", baseLng + offset[1]);

    Map<String, Double> coordinates = new HashMap<>();
    coordinates.put("lat", coords[0]);
    coordinates.put("lng", coords[1]);

    return coordinates;
  }
}

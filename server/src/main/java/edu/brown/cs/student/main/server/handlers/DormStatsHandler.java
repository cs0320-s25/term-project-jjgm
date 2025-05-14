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
    double baseLat = 41.826;
    double baseLng = -71.403;

    Map<String, double[]> dormOffsets = new HashMap<>();

    // -- HELP ME -- THANK YOU
    dormOffsets.put("Andrews", new double[] {0.003, 0.002});
    dormOffsets.put("Barbour", new double[] {0.002, 0.001});
    dormOffsets.put("Buxton", new double[] {0.001, 0.003});
    dormOffsets.put("Caswell", new double[] {0.004, -0.001});
    dormOffsets.put("Chapman", new double[] {0.003, -0.002});
    dormOffsets.put("Keeney", new double[] {-0.002, 0.003});
    dormOffsets.put("Metcalf", new double[] {-0.003, 0.001});
    dormOffsets.put("Miller", new double[] {-0.001, -0.002});
    dormOffsets.put("Minden", new double[] {-0.002, -0.003});
    dormOffsets.put("New Pem", new double[] {0.001, -0.001});
    dormOffsets.put("Slater", new double[] {0.002, -0.003});
    dormOffsets.put("Wayland", new double[] {-0.004, 0.002});
    dormOffsets.put("Wellness", new double[] {-0.001, 0.004});

    // -- for any dorm unlisted above, just place it randomly for testing
    double[] offset;
    if (dormOffsets.containsKey(dormName)) {
      offset = dormOffsets.get(dormName);
    } else {
      int hashCode = dormName.hashCode();
      double latOffset = (hashCode % 100) / 10000.0;
      double lngOffset = ((hashCode / 100) % 100) / 10000.0;
      offset = new double[] {latOffset, lngOffset};
    }

    Map<String, Double> coordinates = new HashMap<>();
    coordinates.put("lat", baseLat + offset[0]);
    coordinates.put("lng", baseLng + offset[1]);

    return coordinates;
  }
}

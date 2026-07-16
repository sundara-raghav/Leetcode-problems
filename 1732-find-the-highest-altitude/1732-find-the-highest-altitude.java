class Solution {
    public int largestAltitude(int[] gain) {
        int altitude = 0;
        int[] point = new int[gain.length + 1];

        point[0] = 0;

        for (int i = 0; i < gain.length; i++) {
            altitude += gain[i];
            point[i + 1] = altitude;
        }

        Arrays.sort(point);

        return point[point.length - 1];
    }
}
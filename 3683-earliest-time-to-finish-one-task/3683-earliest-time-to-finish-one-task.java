class Solution {
    public int earliestTime(int[][] tasks) {
        int earliest = Integer.MAX_VALUE;
        for (int[] task : tasks) {
            int finish = task[0] + task[1];
            if (finish < earliest) earliest = finish;
        }
        return earliest;
    }
}

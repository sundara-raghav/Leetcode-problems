class Solution {
    public int orangesRotting(int[][] grid) {
        int minutes = 0, freshOranges = 0;
        int[][] directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};
        Queue<int[]> queue = new LinkedList<>();

        for (int i = 0; i < grid.length; i++) {
            for (int j = 0; j < grid[0].length; j++) {
                if (grid[i][j] == 2) queue.add(new int[]{i, j});
                else if (grid[i][j] == 1) freshOranges++;
            }
        }
        if (freshOranges == 0) return 0;
        if (queue.isEmpty()) return -1;

        while (!queue.isEmpty() && freshOranges > 0) {
            int size = queue.size();
            minutes++;

            while (size > 0) {     
                int[] curr = queue.poll();           
                for (int[] direction : directions) {
                    int newRow = curr[0] + direction[0], newCol = curr[1] + direction[1];
                    if (newRow >= 0 && newCol >= 0 && newRow < grid.length && newCol < grid[0].length) {
                        if (grid[newRow][newCol] == 1) {
                            grid[newRow][newCol] = 2;
                            queue.add(new int[]{newRow, newCol});                            
                            freshOranges--;
                        }
                    }
                }
                size--;                                
            }
        }

        if (freshOranges == 0) return minutes;
        return -1;
    }   
}
class iPair {
    int i, j, dis;

    iPair(int i, int j, int dis) {
        this.i = i;
        this.j = j;
        this.dis = dis;
    }
}

class Solution {
    public int shortestPathBinaryMatrix(int[][] grid) {
        int rows = grid.length;
        int cols = grid[0].length;

        if(grid[0][0] == 1 || grid[rows-1][cols-1] == 1) return -1;

        int[] dr = new int[]{-1, -1, 0, 1, 1, 1, 0, -1};
        int[] dc = new int[]{0, 1, 1, 1, 0, -1, -1, -1};
        int[][] dis = new int[rows][cols];
        for(int[] row : dis){
            Arrays.fill(row, Integer.MAX_VALUE);
        }
        
        PriorityQueue<iPair> q = new PriorityQueue<>((a,b) -> a.dis - b.dis);

        q.add(new iPair(0, 0, 1));
        dis[0][0] = 1;

        while(!q.isEmpty()){
            iPair p = q.poll();
            int currI = p.i;
            int currJ = p.j;
            int currDis = p.dis;
                
            for(int i=0; i<8; i++){
                int currR = currI + dr[i];
                int currC = currJ + dc[i];

                if(currR >= 0 && currR < rows && currC >= 0 && currC < cols && grid[currR][currC] == 0 && currDis + 1 < dis[currR][currC]){
                    dis[currR][currC] = currDis + 1;
                    q.add(new iPair(currR, currC, dis[currR][currC]));
                }
            }
        }

        return dis[rows-1][cols-1] == Integer.MAX_VALUE ? -1 : dis[rows-1][cols-1];
    }
}
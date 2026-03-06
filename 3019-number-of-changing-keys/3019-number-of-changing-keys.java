class Solution {
    public int countKeyChanges(String s) {
        int changes = 0;
        char prevKey = Character.toLowerCase(s.charAt(0));
        
        for (int i = 1; i < s.length(); i++) {
            char currentKey = Character.toLowerCase(s.charAt(i));
            if (currentKey != prevKey) {
                changes++;
                prevKey = currentKey;
            }
        }
        
        return changes;
    }
}

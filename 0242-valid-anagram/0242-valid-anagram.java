class Solution {
    public boolean isAnagram(String s, String t) {
      if (s.length() != t.length()) {
            return false;
        }
        char[] sS = s.toCharArray();
        char[] tT = t.toCharArray(); 
        Arrays.sort(sS);
        Arrays.sort(tT);
        return Arrays.equals(sS, tT);
    }
}
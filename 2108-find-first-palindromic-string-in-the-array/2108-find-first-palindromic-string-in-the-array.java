class Solution {
    public String firstPalindrome(String[] words) {
        for(int i=0;i<words.length;i++){
            int n=words[i].length()-1;
            Boolean f=true;
            for(int j=0;j<words[i].length()/2;j++){
                if(words[i].charAt(j)!=words[i].charAt(n)){
                    f=false;
                    break;
                }
                n--;
            }
            if(f==true){
                return words[i];
            }
        }
        return "";
    }
}
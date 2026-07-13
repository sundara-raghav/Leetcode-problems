/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */

class Solution {
    public void reorderList(ListNode head) {
        if(head==null) return;
        List<ListNode> n =new ArrayList<>();
        ListNode t=head;
        while(t!=null){
            n.add(t);
            t=t.next;
        }
        int i=0,j=n.size()-1;
        while(i<j){
            n.get(i).next=n.get(j);
            i++;
            if(i==j) break;
            n.get(j).next=n.get(i);
            j--;
        }
        n.get(i).next=null;

    }
}

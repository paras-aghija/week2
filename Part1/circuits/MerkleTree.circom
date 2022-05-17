pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

template CheckRoot(n) { // compute the root of a MerkleTree of n Levels 
    signal input leaves[2**n];
    signal output root;

    //[assignment] insert your code here to calculate the Merkle root from 2^n leaves
    signal intermediate[2**n];
    component hash[2**n];
    var x = 2**n-1;
    // log(x);
    for(var i=2**n-1;i>0;i--){
        hash[i] = Poseidon(2);   
        if(x>0){
            hash[i].inputs[1] <== leaves[x];
            x--;
            hash[i].inputs[0] <== leaves[x];
            x--;
            intermediate[i] <== hash[i].out;
        } 
        else {
            hash[i].inputs[0] <== intermediate[2*i];
            hash[i].inputs[1] <== intermediate[2*i+1];
            intermediate[i] <== hash[i].out;
            // log(hash.out);
        }
        log(hash[i].out);
    }

    root <== intermediate[1];
     
}

template MerkleTreeInclusionProof(n) {
    signal input leaf;
    signal input path_elements[n];
    signal input path_index[n]; // path index are 0's and 1's indicating whether the current element is on the left or right
    signal output root; // note that this is an OUTPUT signal

    //[assignment] insert your code here to compute the root from a leaf and elements along the path

    component hash[n];
    signal arr[2*n+1];
    var x=0;
    arr[0]<==leaf;
    var j=0;
    component mux1[n];
    component mux2[n];

    for(var i=0;i<n;i++)
    {
        mux1[j]=Mux1();
        mux2[j]=Mux1();
        hash[i]=Poseidon(2);
        

        mux1[j].c[0]<==path_elements[i];
        mux1[j].c[1]<==arr[x];
        mux1[j].s<==path_index[i];
        hash[i].inputs[0]<==mux1[j].out;
        
        mux2[j].c[0]<==arr[x];
        mux2[j].c[1]<==path_elements[i];
        mux2[j].s<==path_index[i];
        hash[i].inputs[1]<==mux2[j].out;
        
        j++;
        x++;
        arr[x]<==hash[i].out;
    }
    root<==arr[x];
}
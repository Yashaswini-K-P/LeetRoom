const fetchUsersolved = async (username)=>{
    try{
        const response = `https://leetcode-api-pied.vercel.app/user/${username}/solved`;
        const res = await fetch(response);
        const data = res.json();
        return data;
    }catch(error){
        console.error("Error fetching LeetCode stats:", error);
        return null;
    }
};

module.exports={
    fetchUsersolved,
}
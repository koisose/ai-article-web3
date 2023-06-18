import { useState, useEffect } from "react";
import type { NextPage } from "next";
import ReactMarkdown from 'react-markdown'
import {Address} from "~~/components/scaffold-eth";
import {useWaitForTransaction, useContractWrite, useAccount,useContractRead } from 'wagmi';
import {useDeployedContractInfo} from "~~/hooks/scaffold-eth";
import remarkGfm from 'remark-gfm'
import { useIsMounted } from "usehooks-ts";
import {createClient} from "@supabase/supabase-js";
import BN from 'bn.js';
import contractsData from "~~/generated/hardhat_contracts";
import {Abi} from "abitype";
import {getTargetNetwork} from "~~/utils/scaffold-eth";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
// pages/article/[articleId].js

export async function getServerSideProps(context:any) {
  const { params } = context;
  const { slug } = params;

  // Fetch the data for the article with the given articleId
  // (Replace this with your API call or data fetching logic)


  return {
    props: {
      slug,
    },
  };
}

const Debug: NextPage = ({slug}:any) => {
const [allData,setAllData]=useState<any>([])
  const [childOwner,setChildOwner]=useState<boolean>(false)
  const [loading,setLoading]=useState<boolean>(false)
  const [comment,setComment]=useState<string>("")
  const [allComment,setAllComment]=useState<any>([])
  const configuredNetwork = getTargetNetwork();
const {data: lazyMintNFTData} = useDeployedContractInfo("LazyMintNestedNFT");
const uniqueId = slug?.[1];
const uuid = slug?.[0];
const {address} = useAccount();
const {isMounted}=useIsMounted()


    const { refetch:refetchOwner,data:dataOwners } = useContractRead({
  address: contractsData[configuredNetwork.id][0].contracts.LazyMintNestedNFT.address ,
  abi: contractsData[configuredNetwork.id][0].contracts.LazyMintNestedNFT.abi as Abi,
  functionName: 'ownerOf',
  args: [uniqueId],
  onError(err){
    console.log(err)
  }
});
const { refetch:refetchChild,data:dataChilds } = useContractRead({
  address: contractsData[configuredNetwork.id][0].contracts.LazyMintNestedNFT.address as `0x${string}`,
  abi: contractsData[configuredNetwork.id.toString()][0].contracts.LazyMintNestedNFT.abi as Abi,
  functionName: 'getChildTokenOwner',
  args: [address,uniqueId],

});
async function getAllComment(){
  try{
    const {data}=await supabase
    .from('comment')
    .select(`address,comment`)
      .eq("article_id",uuid)
    setAllComment(data as any)
  }catch{}
}
  async function fetchData() {
    try{

console.log("FETTFTGCGCGCG")
      const { data:dataOwner } = await refetchOwner();
      const { data:dataChild } = await refetchChild();
console.log(dataChild)
      if(dataOwner===address){
console.log("dsa")

        setChildOwner(true)
        supabase
    .from('list_article')
    .select(`title,image,description,cid,price,private,id,article,address,token_id`)
      .eq("id",uuid).then(({data})=>setAllData(data));
      }else if(dataChild?.toString()==="1"){


        setChildOwner(true)
        supabase
    .from('list_article')
    .select(`title,image,description,cid,price,private,id,article,address,token_id`)
      .eq("id",uuid).then(({data})=>setAllData(data));
      }else if(address){
        setChildOwner(false)
        console.log("dalsad")
        supabase
    .from('list_article')
    .select(`title,image,description,cid,price,private,id,address,token_id`)
      .eq("id",uuid).then(({data})=>setAllData(data));
      }






    }catch(e){
      console.log(e.message)
//      fetchData()
    }


  }
  const {data: dataMarket, writeAsync: writeMarket} = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: contractsData[configuredNetwork.id][0].contracts.NFTMarketplace.address as `0x${string}`,
    abi: contractsData[configuredNetwork.id][0].contracts.NFTMarketplace.abi as Abi,
    chainId: configuredNetwork.id,
    functionName: 'buyNFT',

    onError() {
      console.log("err NFT")
      setLoading(false);
      },
  });
useWaitForTransaction({
  hash: dataMarket?.hash,
  async onSettled() {

    console.log("sucessdsadasdsadsa")
    setLoading(false);
    await fetchData()
    },
  onError() {
    console.log("err")
    setLoading(false);
    },
});
function etherToWei(ether:number) {
  const etherString = ether.toString();
  const parts = etherString.split('.');
  const wholeNumber = parts[0];
  const fractionalNumber = parts.length > 1 ? parts[1] : '0';
  const base = new BN('10').pow(new BN('18'));
  const wei = new BN(wholeNumber).mul(base);
  const fractionalWei = new BN(fractionalNumber).mul(base).div(new BN('10').pow(new BN(fractionalNumber.length)));
  return wei.add(fractionalWei);
}
  async function makeComment(){
  setLoading(true)
  try{
    await supabase
                .from("comment")
                .insert([
                  {article_id:uuid,address, comment},
                  ]);
    await getAllComment()
    setLoading(false)
  }catch{
    setLoading(false)
  }

}
async function buyNft(){
  await writeMarket?.({recklesslySetUnpreparedArgs: [uniqueId],recklesslySetUnpreparedOverrides: {

    value: etherToWei(allData?.[0]?.price).toString(),
  }});
}
  async function postData(url: string, data: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}
  async function generate() {
  try {
    setLoading(true)
    setComment("")
    const value = localStorage.getItem('key');
    const response = await fetch("/api/c", {
      method: "POST",
  headers: {
        "Content-Type": "application/json",
  },
      body: JSON.stringify({api: value, comment:allData?.[0]?.article}),
});

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setComment((prev) => prev + chunkValue);
    }


    setLoading(false)
  } catch (e) {
    console.log(e.message)
    setLoading(false)
  }

}
  useEffect(() => {
    fetchData();
    getAllComment();
    }, [address]);
  return (
    <>
      <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center ">

        <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 w-full max-w-7xl">
          <div className="col-span-1 flex flex-col">
            <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
              <div className="flex">
                <div className="flex flex-col gap-1">
                  <span className="font-bold">Article Creator</span>
                  <Address address={allData?.[0]?.address} />
                  <span className="font-bold">NFT Collection Address</span>
                  <Address address={lazyMintNFTData?.address} />
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-sm">Price:</span>
                    {allData?.[0]?.price} MATIC
                </div>
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-sm">Token ID:</span>
                    {allData?.[0]?.token_id}
                  </div>
                </div>
              </div>

            </div>

          </div>

          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            <div className="bg-base-300 rounded-3xl px-6 lg:px-8 py-4 shadow-lg shadow-base-300">

              <ReactMarkdown className="prose lg:prose-xl" remarkPlugins={[remarkGfm]}>
                {childOwner?allData?.[0]?.article:allData?.[0]?.description}
              </ReactMarkdown>
            </div>

            <div className="z-10">

              <div className="text-center bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative">

                {!childOwner && (<>
                <p>Buy now so you can comment and read the full article</p>
                <button className="btn btn-accent mx-3 my-2" onClick={buyNft}>Buy Now</button>

                </>)}
                {childOwner && <div className="mx-2 my-2">
                  <textarea value={comment} disabled={loading}
                    onChange={e => setComment(e.target.value)} className="textarea textarea-bordered w-full " placeholder="Comment"/>
                  <button onClick={makeComment} disabled={loading} className="btn btn-accent mx-3 my-2">Send Comment</button>
                  <button disabled={loading} className="btn btn-accent mx-3 my-2" onClick={generate}>Generate Comment</button>
              </div>}
              </div>
            </div>
            {allComment.map(a=><div key={a.id} className="z-10">
              <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-3 relative">

                <div className="p-5 divide-y divide-base-300">
                  <Address address={a?.address} />
                 {a.comment}
                </div>
              </div>
            </div>)}

          </div>
        </div>

      </div>

    </>
  );
};

export default Debug;

import Head from "next/head";
import type {NextPage} from "next";
import Link from "next/link";
import {useState, useEffect,useRef} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {useDeployedContractInfo} from "~~/hooks/scaffold-eth";
import {NFTStorage} from 'nft.storage';
import {useWaitForTransaction, useContractWrite, useAccount } from 'wagmi';
import {getTargetNetwork} from "~~/utils/scaffold-eth";
import {Abi} from "abitype";
import BN from 'bn.js';

import {createClient} from "@supabase/supabase-js";


const NavLink = ({href, children}: { href: string; children: React.ReactNode }) => {


    return (
        <Link
            href={href}
            passHref

        >
            {children}
        </Link>
    );
};
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const client = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFT_STORAGE as string,
});
const Home: NextPage = () => {
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
    const [key, setKey] = useState("")
    const [title, setTitle] = useState("")
    const [image, setImage] = useState("")
    const [article, setArticle] = useState("")
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState(false)
    const [checked, setChecked] = useState(true)
    const [cidd, setCid] = useState("")
    const [price, setPrice] = useState(0)
    const [allData, setAllData] = useState<any>([])
    const [generates, setGenerates] = useState<boolean>(false)
    const configuredNetwork = getTargetNetwork();
    const {address} = useAccount();
    async function fetchData() {
        const { data, error } = await supabase
    .from('list_article')
    .select('title,image,cid,price,private,id,description,token_id');

        setAllData(data)
        if (error) {
            console.error('Error fetching data:', error);
        } else {
            console.log('Data:', data);
        }
    }

    const {data: lazyMintNFTData, isLoading: lazyMintNFTLoading} = useDeployedContractInfo("LazyMintNestedNFT");
    const {data: NFTMarketplaceData, isLoading: NFTMarketplaceLoading} = useDeployedContractInfo("NFTMarketplace");
    const {data: dataNFT, writeAsync: writeNFT} = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: lazyMintNFTData?.address as `0x${string}`,
        abi: lazyMintNFTData?.abi as Abi,
        chainId: configuredNetwork.id,
        functionName: 'lazyMint',

        onError() {
            console.log("err NFT")
            setLoading(false);
        },
    });

    const {data: dataMarketplace, writeAsync: writeMarketplace} = useContractWrite({
        mode: 'recklesslyUnprepared',
        address: NFTMarketplaceData?.address as `0x${string}`,
        abi: NFTMarketplaceData?.abi as Abi,
        chainId: configuredNetwork.id,
        functionName: 'offerNFT',

        onError() {
            console.log("err NFT")
            setLoading(false);
        },
    });
    useWaitForTransaction({
        hash: dataNFT?.hash,
        async onSettled(data) {
console.log(data)

            const { data:supaData, error:haha } = await supabase
    .from('list_article')
    .select('token_id,address')
    .eq('token_id', parseInt(data?.logs[1].data as string))
            .eq('address', address);
if(supaData?.length===0){
    await writeMarketplace?.({recklesslySetUnpreparedArgs: [parseInt(data?.logs[1].data as string), etherToWei(price).toString()]});
    const regex = /## Introduction\n([^\n]+)/;
    let description = title;
    const markdown = article;
    const matches = markdown.match(regex);
    if (matches && checked) {
        const introduction = matches[1];
        description = introduction;
    } else if (checked) {
        description = "# buy the nft to see full article"
    }
    const {error} = await supabase
                .from("list_article")
                .insert([
                    {private:checked?1:0,description,address, cid: cidd, title, image, article, price, token_id: parseInt(data?.logs[1].data as string)},
                    ]);

    if (error) {
        console.log("Error inserting data:", error);
        return;
    }
    fetchData()
    if (buttonRef.current) {
        buttonRef?.current?.click();
    }
    console.log("Data inserted:", data);
    console.log("sucess")
    setLoading(false);
}

        },

        onError() {
            console.log("err")
            setLoading(false);
        },
    });
    useWaitForTransaction({
        hash: dataMarketplace?.hash,
        async onSuccess() {

            console.log("sucess")
            setLoading(false);
        },
        onError() {
            console.log("err")
            setLoading(false);
        },
    });

    async function saveArticle() {
        setLoading(true);


        try {
            const regex = /## Introduction\n([^\n]+)/;
            let description = title;
            const markdown = article;
            const matches = markdown.match(regex);
            if (matches && checked) {
                const introduction = matches[1];
                description = introduction;
            } else if (checked) {
                description = "# buy the nft to see full article"
            }
            const someData = new Blob([JSON.stringify({name: title, description, image})]);
            const cid = await client.storeBlob(someData);
            setCid(cid)
            await writeNFT?.({recklesslySetUnpreparedArgs: [address, cid]});

        } catch (e) {
            if (e instanceof Error) {
                setLoading(false);

            }
        }
    }

    function saveKey() {
        setLoading(true)
        localStorage.setItem('key', key);
        setKey("")
        setLoading(false)
    }

    const handleInputChange = (event: any) => {
        setKey(event.target.value);
    }

    async function postData(url: string, datas: any,disp:any) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datas),
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
            disp((prev) => prev + chunkValue);
        }
        setGenerates(false)
    }
    function getRandomNumber(min:any, max:any) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    useEffect(() => {
        fetchData();
        if(generates){
//            setLoading(true)
            const value = localStorage.getItem('key');
            postData("/api/b", {api: value,title},setArticle).then(()=>setLoading(false))
        }
        }, [generates]);
    async function generate() {
        try {

            setLoading(true)
            setImage("")
            setTitle("")
            setArticle("")
            const value = localStorage.getItem('key');
            await postData("/api/a", {api: value},setTitle)
            setGenerates(true)
            setImage(`https://source.unsplash.com/random?abstract,voxel,minecraft,lego,architecture&sig=${getRandomNumber(1, 100)}`)
//            setLoading(false)

        } catch (e) {
            console.log(e.message)
            setLoading(false)
            setGenerates(false)
        }

    }
    const buttonRef = useRef(null);
    return (
        <>
            <Head>
                <title>Decentral</title>
                <meta name="description" content="Created with 🏗 scaffold-eth"/>
            </Head>

            <div className="flex items-center flex-col flex-grow pt-10">
                <div className="px-5">
                    <h1 className="text-center mb-8">
                        <span className="block text-2xl mb-2">AI Decentralized Substack</span>
                        <span className="block text-4xl font-bold">Article creator</span>
                    </h1>
                    <p className="text-center text-lg">
                        With this AI article generator create a random article and sell it like you did in substack
                    </p>
                    <div className="flex justify-center">

                        <div className="form-control w-full max-w-xs text-center">
                            <p>
                                generate random article using Open AI GPT-3 your api key will be saved
                             inside localstorage dont forget to clear cache after using this site

                            </p>
                            <label className="label">
                                <span className="label-text font-bold text-lg">Open AI API KEY</span>
                            </label>
                            <input type="text" disabled={loading} value={key} onChange={handleInputChange}
                                   placeholder="Open AI API KEY" className="input input-bordered w-full max-w-xs"/>
                            <button className="btn btn-accent my-3" disabled={loading} onClick={saveKey}>Save</button>
                        </div>
                    </div>
                </div>

                <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">

                    <div className="flex justify-center">
                        {/* The
                      to open modal */}
                        <label htmlFor="my-modal-3" className="btn">Create Article</label>

                        {/* Put this part before </body> tag */}
                        <input type="checkbox" id="my-modal-3" className="modal-toggle"/>
                        <div className="modal">
                            <div className="modal-box relative w-11/12 max-w-5xl" htmlFor="">
                                <label htmlFor="my-modal-3" ref={buttonRef}
                                       className="btn btn-sm btn-circle absolute right-2 top-2">✕</label>
                                <div className="flex flex-col items-center space-y-4 ">
                                    <h3 className="text-lg font-bold text-center">Create article</h3>
                                    <p>(using openai api will incur some fees even if its error
                                        , i will not be responsible for any fees loss during the usage of my app, use it
                                        at your own discretion)</p>
                                    <p>
                                        generate random article

                                    </p>

                                    <button className="btn btn-accent" disabled={loading} onClick={generate}>Generate
                                    </button>
                                </div>
                                <div className="flex justify-center">
                                    <div className="form-control w-full max-w-xs text-center">
                                        <label className="label">
                                            <span className="label-text font-bold text-lg">Title</span>
                                        </label>
                                        <input value={title} disabled={loading} onChange={e => setTitle(e.target.value)}
                                               type="text" placeholder="Title"
                                               className="input input-bordered w-full max-w-xs"/>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <div className="form-control w-full max-w-xs text-center">
                                        <label className="label">
                                            <span className="label-text font-bold text-lg">Image URL</span>
                                        </label>
                                        {image.trim().length > 0 ?
                                            <img className="my-5" height="300" src={image}/> : ""}
                                        <input value={image} disabled={loading} onChange={e => setImage(e.target.value)}
                                               type="text" placeholder="Image URL"
                                               className="input input-bordered w-full max-w-xs"/>
                                    </div>
                                </div>
                                <div className="flex justify-center w-full">
                                    <div className="form-control w-full text-center">
                                        <label className="label">
                                            <span className="label-text font-bold text-lg">Article Markdown</span>
                                            <button onClick={() => setPreview(!preview)}
                                                    className={`btn ${preview ? "btn-active btn-error" : "btn-accent"}`}>{preview ? "Cancel" : "Preview"}</button>
                                        </label>
                                        <textarea value={article} disabled={loading}
                                                  onChange={e => setArticle(e.target.value)}
                                                  className={`textarea-primary w-full h-24 ${preview ? "hidden" : ""}`}
                                                  placeholder="Article Text Markdown"/>

                                    </div>

                                </div>
                                {preview && <div
                                    className="bg-base-300 rounded-3xl px-6 lg:px-8 py-4 shadow-lg shadow-base-300">
                                    <ReactMarkdown className="prose lg:prose-xl" remarkPlugins={[remarkGfm]}>
                                        {article}
                                    </ReactMarkdown>
                                </div>}

                                <div className="my-3 w-24">
                                    <label className="label cursor-pointer hidden">
                                        <span className="label-text mx-2">Private</span>
                                        <input type="checkbox" className="toggle" checked={checked}
                                               onChange={() => setChecked(!checked)}/>
                                        <div className="tooltip tooltip-right"
                                             data-tip="if toggled to the right its private and reader need to pay to read the article, if toogled to the left its public">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                 className="stroke-info flex-shrink-0 w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                    </label>
                                </div>
                                <div className="flex justify-center">
                                    <div className="form-control w-full max-w-xs text-center">
                                        <label className="label">
                                            <span className="label-text font-bold text-lg">Price</span>
                                        </label>
                                        <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                                               disabled={loading} placeholder="Price"
                                               className="input input-bordered w-full max-w-xs"/>
                                    </div>
                                </div>
                                <button className="btn btn-accent my-5" onClick={saveArticle}
                                        disabled={loading || lazyMintNFTLoading || NFTMarketplaceLoading}>Save article
                                </button>
                            </div>
                        </div>


                    </div>
                    {allData.map(a=>(
                        <div key={a.id} className="flex justify-center items-center gap-12 flex-col sm:flex-row">
                            <NavLink href={`/article/${a.id}/${a.token_id}`}>
                                <div
                                    className="card w-96 bg-base-100 shadow-xl mt-5  p-4 cursor-pointer hover:bg-gray-100 focus:outline-none">
                                    <figure><img src={a.image} alt="Shoes"/>
                                    </figure>
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            {a.title}

                                        </h2>

                                        <div className="card-actions justify-end">
                                            <div className="badge badge-outline">{a.price} MATIC</div>
                                        </div>
                                    </div>
                                </div>
                            </NavLink>

                        </div>
                    ))}

                </div>
            </div>
        </>
    );
};

export default Home;

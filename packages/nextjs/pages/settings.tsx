import Head from "next/head";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();
 

  return (
    <Link
      href={href}
      passHref
  
      >
      {children}
    </Link>
    );
};
const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div >
          <h1 className="text-center mb-8">
            
            <span className="block text-4xl font-bold">Settings</span>
          </h1>
          

        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-1 flex-col">
            <label htmlFor="openai-api-key" className="text-lg font-semibold mb-2">
              OpenAI API Key
            </label>
            <input
              type="text"
              id="openai-api-key"
              placeholder="Open AI API KEY"
              className="input w-full max-w-xs"
            />
            <button className="btn btn-primary w-full sm:w-auto mt-4">Save</button>
          </div>
        </div>
        
        
      </div>
    </>
  );
};

export default Home;

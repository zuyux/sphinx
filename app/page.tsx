'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { supabase } from '../supabase'; 

// Define the expected type for user data
interface UserData {
  profile: {
    stxAddress: {
      mainnet: string;
    };
  };
  name?: string; 
  image?: string; 
}

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Verificar si ya existe una sesión activa al montar el componente
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData() as UserData;
      setUserData(userData);
    } else if (userSession.isSignInPending()) {
      // Si la sesión está en proceso de inicio, manejarla
      userSession.handlePendingSignIn().then((userData: UserData) => {
        setUserData(userData as UserData);
      });
    }
  }, []);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Sphinx',
        icon: 'https://sphinx-brown.vercel.app/icon.png',
      },
      userSession,
      onFinish: async () => {
        const userData = userSession.loadUserData() as UserData;
        setUserData(userData);

        // Save user data to Supabase if not already registered
        if (userData) {
          const walletAddress = userData.profile.stxAddress.mainnet;

          // Check if user already exists in the database
          const { data, error } = await supabase
            .from('sph_users')
            .select('*')
            .eq('add', walletAddress);

          if (error) {
            console.error('Error checking user:', error);
            return;
          }

          if (data && data.length === 0) {
            // If no existing user, insert a new record
            const { error: insertError } = await supabase.from('sph_users').insert([
              {
                add: walletAddress,
                name: userData.name || 'nony',
                pic: userData.image || null,
              },
            ]);

            if (insertError) {
              console.error('Error inserting user:', insertError);
            } else {
              console.log('User inserted successfully!');
            }
          } else {
            console.log('User already exists in the database.');
          }
        }
      },
    });
  };

  // Función para formatear la dirección
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 5)}...${address.slice(-3)}`;
  };

  return (
    <div className="mx-auto">
      <Link href="/" className='fixed top-4 left-6 font-bold'>sphinx</Link>
      <span className='fixed top-5 left-[91px] text-[11px] py-[1px]'>ANSWER TO EARN</span>
      <div>
        <Image src="/hero.png" height={600} width={1200} alt="sphinx-hero-img"
        className='mt-16 lg:mt-0 mx-auto w-full rounded-3xl'></Image>
      </div>
      {userData ? (
        <Link href={`/avatar/${userData.profile.stxAddress.mainnet}`}>
          <button className="fixed top-4 right-6 text-[11px]">
            {formatAddress(userData.profile.stxAddress.mainnet)}
          </button>
        </Link>
      ) : (
        <button className="fixed top-4 right-6 text-[11px]" onClick={connectWallet}>
          CONNECT
        </button>
      )}
      
      <div className="lg:w-1/2 mx-auto px-2 py-16">
        <div className="">
          <h1 className="text-lg font-bold">sphinx:</h1>
          <Link href="/qid/ST28B2GFEWHR2MXA6P0XNW2GVV9K30HYSC3D9Q0SR.X2410172">
            <h2 className="text-3xl mt-4 mb-8 sharetech bg-white bg-opacity-5 border-[1px] border-[#f5f5f5] rounded-md p-4">
              Dada la creciente preocupación por el conflicto en Gaza y su impacto humanitario, ¿qué estrategias deberían adoptarse a nivel internacional para garantizar la seguridad de los civiles y lograr un cese al fuego efectivo?
            </h2>
          </Link>
          <p><b>Contexto:</b> El conflicto en Gaza ha escalado dramáticamente en el último año, resultando en decenas de miles de muertes y desplazamientos masivos, con más del 90% de la población en Gaza forzada a abandonar sus hogares. La situación ha generado una crisis humanitaria que exige la atención de la comunidad internacional.</p>
          <Link href="/qid/ST28B2GFEWHR2MXA6P0XNW2GVV9K30HYSC3D9Q0SR.X2410172"><button className="border-[1px] border-[#f1f1f1] rounded-md px-4 py-4 my-8 w-full hover:bg-white hover:text-[#702809]">Responder</button></Link>
        </div>
        <div className="px-2">
          <h1 className="text-lg font-bold">sphinx:</h1>
          <Link href="/qid/ST28B2GFEWHR2MXA6P0XNW2GVV9K30HYSC3D9Q0SR.X2410173">
            <h2 className="text-3xl mt-4 mb-8 sharetech bg-white bg-opacity-5 border-[1px] border-[#f5f5f5] rounded-md p-4">
              Ante la reciente emisión de una poderosa llamarada solar de clase X9.0 capturada por el Observatorio de Dinámica Solar de la NASA, ¿cuáles deberían ser los protocolos de protección para las infraestructuras energéticas y tecnológicas frente a futuros eventos solares extremos?
            </h2>
          </Link>
          <p><b>Contexto:</b> Este tipo de eventos solares extremos pueden causar tormentas geomagnéticas que afectan el campo magnético terrestre, alterando las comunicaciones por radio, los sistemas de navegación GPS, y provocando fluctuaciones en las redes eléctricas. Las partículas cargadas liberadas por la llamarada pueden inducir corrientes geomagnéticas en líneas de alta tensión, transformadores y equipos eléctricos, provocando daños permanentes y apagones regionales. Además, los satélites y las estaciones espaciales también están en riesgo, ya que la radiación intensa puede dañar sus componentes electrónicos y alterar su órbita.</p>
          <Link href="/qid/ST28B2GFEWHR2MXA6P0XNW2GVV9K30HYSC3D9Q0SR.X2410173"><button className="border-[1px] border-[#f1f1f1] rounded-md px-4 py-4 my-8 w-full hover:bg-white hover:text-[#702809]">Responder</button></Link>
        </div>
      </div>
    </div>
  );
}

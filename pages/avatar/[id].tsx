// pages/avatar/[id].tsx
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { supabase } from '../../supabase'; 
import { useEffect, useState } from 'react';
import "@/app/globals.css";

interface User {
  add: string;
  name: string;
  pic: string;
}

// Define the expected type for user data
interface UserData {
    profile: {
      stxAddress: {
        mainnet: string;
      }
    };
    name?: string; 
    image?: string; 
  }
  
  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

export default function AvatarPage() {
  const router = useRouter();
  const { id } = router.query; // Obtén el parámetro 'id' de la URL
  const [user, setUser] = useState<User | null>(null);

  // Obtener datos del usuario desde Supabase basado en el ID
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
    if (id) {
      const fetchUser = async () => {
        const { data, error } = await supabase
          .from('sph_users')
          .select('*')
          .eq('add', id)
          .single(); // Obtener un solo registro

        if (error) {
          console.error('Error fetching user:', error);
        } else {
          setUser(data);
        }
      };
      fetchUser();
    }
  }, [id]);

  const [userData, setUserData] = useState<UserData | null>(null);

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

  if (!user) {
    return <div className='text-[11px] m-2'>LOADING...</div>;
  }

  return (
    <div className="flex flex-col items-center mt-8">
      <Link href="/" className='fixed top-2 left-4 font-bold'>sphinx</Link>
      {userData ? (
        <Link href={`/avatar/${userData.profile.stxAddress.mainnet}`}>
          <button className="fixed top-2 right-4 text-[11px]">
            {formatAddress(userData.profile.stxAddress.mainnet)}
          </button>
        </Link>
      ) : (
        <button className="fixed top-2 right-4" onClick={connectWallet}>
          Connect
        </button>
      )}
      <div className='mx-auto'>
        <Image
            src={user.pic || '/def.png'}
            alt={`${user.name}'s profile`}
            height={50}
            width={50}
            className="rounded-full m-4"
        />
      </div>
      <div className='text-center'>
        <h1 className="text-2xl font-bold mb-2 sharetech">{user.name || 'nony'}</h1>
        <p className="text-gray-500 text-[11px]">{user.add}</p>
      </div>
      <div className='responses lg:w-1/3 mt-8'>
        <h2 className='px-2 text-[11px]'>RESPUESTAS:</h2>
        <div className="responses px-2">
        <div className="p-4 my-4 border-[1px] border-[#702809] rounded-md">
        <p className="block break-words text-[11px] mb-4">• {user.add}</p>
        <p>Para garantizar la seguridad de los civiles y lograr un cese al fuego efectivo en Gaza, la comunidad internacional debería implementar una estrategia multifacética que incluya la facilitación de un **alto el fuego inmediato y supervisado por la ONU**, el establecimiento de **corredores humanitarios seguros** para el acceso de ayuda médica y alimentos, y la implementación de un **proceso de mediación internacional** con la participación de actores neutrales para negociar un acuerdo a largo plazo que aborde las raíces del conflicto. Además, es crucial suspender el suministro de armas a todas las partes involucradas y sancionar severamente cualquier violación de los derechos humanos, mientras se promueve una **solución diplomática** basada en la coexistencia pacífica y el respeto mutuo a la integridad territorial y a los derechos de los civiles.</p>
        <button className="border-[1px] border-[#f1f1f1] rounded-md px-4 py-2 my-8 w-full hover:bg-white hover:text-[#702809]">+ Apoyar</button>
        </div>
        <div className="p-4 my-4 border-[1px] border-[#702809] rounded-md">
        <p className="block break-words text-[11px] mb-4">• {user.add}</p>
        <p>Para lograr un cese al fuego efectivo y proteger a los civiles en Gaza, se debe establecer una **zona de desmilitarización temporal** bajo la supervisión de una coalición internacional compuesta por representantes de la ONU y organizaciones humanitarias, acompañada de un monitoreo constante mediante tecnología de vigilancia no intrusiva como drones y satélites. Esto debe estar respaldado por la creación de un **comité de negociación inclusivo**, que incorpore no solo a líderes políticos, sino también a actores locales y comunidades afectadas, promoviendo un diálogo que busque compromisos tangibles y sostenibles. Al mismo tiempo, es necesario implementar un **mecanismo de rendición de cuentas** que investigue y sancione cualquier ataque deliberado contra civiles, garantizando justicia y previniendo futuras escaladas de violencia.</p>
        <button className="border-[1px] border-[#f1f1f1] rounded-md px-4 py-2 my-8 w-full hover:bg-white hover:text-[#702809]">+ Apoyar</button>
        </div>
    </div>
      </div>
    </div>
  );
}

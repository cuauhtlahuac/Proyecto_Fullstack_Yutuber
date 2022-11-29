import { type ActionFunction } from '@remix-run/node';
import ytdl from 'ytdl-core';
import { type ChangeEvent, useState } from 'react';
import Button from '~/components/Button';
import Input from '~/components/Input';
import MiniTable, { type Format } from './MiniTable';
import Header from '~/components/Header';
import Spinner from '../components/Spinner';
import { Form, Link, useActionData, useFetcher, useTransition } from '@remix-run/react';
import { NavLink } from 'react-router-dom';

interface ActionData {
  title: string;
  thumbnail: string;
  duration: number | string;
  formats: Format[];
}
export const action: ActionFunction = async ({ request }): Promise<ActionData | null> => {
  // 1.- necesitamos obtener la url del video de youtube DONE!
  const formData = await request.formData();
  let url = formData.get("url");
  if (!url) return null;

  const info = await ytdl.getInfo(url);
  console.log({ info });
  const result = {
    title: info.videoDetails.title,
    thumbnail:
      info.videoDetails?.thumbnails[info.videoDetails?.thumbnails.length - 1]
        ?.url,
    duration: info.videoDetails?.lengthSeconds,
    formats: info.formats.filter((f) => f.hasAudio && f.hasVideo),
  };
  return result;
};

export default function Thumb() {
  // 2.- Necesitamos una manera de recibir la respuesta del action y/o las transiciones (loading, idle etc.) DONE!
  const actionResponse = useActionData();
  const { state } = useTransition();
  const [url, setURL] = useState('https://youtu.be/lV61TDHiALo');
  const handleDownload = (format: Format) => {
    //5.- una vez que mostramos los resultados necesitamos abrir una nueva pestaña para descargar el video
    const urlWithParams = `download/?url=${url}&itag=${format.itag}`;
    console.log({ url, actionResponse, urlWithParams, format })
    window.location.href = urlWithParams;
  };

  return (
    <section className='bg-violet-200 text-violet-800 h-screen flex flex-col gap-8 items-center py-20'>
      <Header />
      {/* 3.-  Necesitamos un form para enviar la petición post DONE!*/}
      <div className='rounded-xl shadow-xl flex'>
        <Form method="post">
          <Input
            placeholder='Escribe tu link'
            value={url}
            name='url'
            onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
              setURL(value)
            }
          />
          <Button type='submit'>
            {/* 4.- Aquí necesitamos una manera de mostrar un loading DONE!*/}
            {!(state === 'submitting' || state === "loading") ? 'Analizar' : <Spinner />}
          </Button>
        </Form>
      </div>
      {/* 6.- La data que nos devuelve el action tiene que usarse para mostrar 
      la mini tabla, así como entregarsele DONE!*/}
      {actionResponse && <MiniTable data={actionResponse} onClick={handleDownload} />}
    </section>
  );
}

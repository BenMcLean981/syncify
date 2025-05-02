'use client';

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { FaDivide, FaMinus, FaPlus } from 'react-icons/fa6';
import { Button } from '../components/button';

export default function Home() {
  const [state, setState] = useState<number>(0);
  const [value, setValue] = useState<string>('');

  const num = parseFloat(value);
  const isInvalid = Number.isNaN(num);

  function handleAdd(): void {
    if (isInvalid) {
      throw new Error('Invalid value');
    }

    setState((state) => state + num);
  }

  function handleSubtract(): void {
    if (isInvalid) {
      throw new Error('Invalid value');
    }

    setState((state) => state - num);
  }

  function handleMultiply(): void {
    if (isInvalid) {
      throw new Error('Invalid value');
    }

    setState((state) => state * num);
  }

  function handleDivide(): void {
    if (isInvalid) {
      throw new Error('Invalid value');
    }

    setState((state) => state / num);
  }

  function handleSet(): void {
    if (isInvalid) {
      throw new Error('Invalid value');
    }

    setState(num);
  }

  return (
    <main className="w-full h-full flex flex-col justify-center items-center gap-16">
      <h1 className={'text-4xl text-orange-300'}>
        Welcome to the Syncify Demo!
      </h1>
      <span className={'inline-flex items-center text-4xl gap-4'}>
        <span className={'text-orange-200'}>State:</span>{' '}
        <span className={'text-4xl bg-white border-2 border-black rounded p-2'}>
          {state}
        </span>
      </span>
      <div className={'flex items-center gap-4'}>
        <input
          className={
            'text-2xl bg-white border-2 border-black rounded p-2 w-[100px]'
          }
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button disabled={isInvalid} onClick={handleAdd}>
          <FaPlus fill={'white'} size={24} />
        </Button>
        <Button disabled={isInvalid} onClick={handleSubtract}>
          <FaMinus fill={'white'} size={24} />
        </Button>
        <Button disabled={isInvalid} onClick={handleMultiply}>
          <FaTimes fill={'white'} size={24} />
        </Button>
        <Button disabled={isInvalid} onClick={handleDivide}>
          <FaDivide fill={'white'} size={24} />
        </Button>
        <Button disabled={isInvalid} onClick={handleSet} primary>
          <span className={'text-[24px] leading-0'}>Set</span>
        </Button>
      </div>
    </main>
  );
}

import { PropsWithChildren } from 'react';

export type ButtonProps = {
  onClick?: () => void;

  primary?: boolean;

  disabled?: boolean;
};

export function Button(props: PropsWithChildren<ButtonProps>) {
  const { onClick, primary, disabled } = props;

  return (
    <button
      className={`${primary ? 'bg-orange-300 text-neutral-800' : 'bg-gray-600 text-white'} px-4 py-3 rounded cursor-pointer active:translate-y-1/12 disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled}
    >
      {props.children}
    </button>
  );
}

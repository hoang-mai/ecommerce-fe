type Props = {
  title: string;
  isDivide?: boolean;
};
export default function Title({title, isDivide}: Props) {
  return <>
    <h1
      className="text-3xl font-bold text-primary-c900 hover:bg-primary-c100 rounded-lg transition-colors p-2 w-fit">
      {title}
    </h1>
    {isDivide && <hr className="border-t border-dashed border-grey-c300 w-full mb-4"/>}
  </>;
}
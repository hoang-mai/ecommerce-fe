type Props = {
  className?: string;
}
export default function Divide({className}: Props) {
  return <hr className={`border-t border-dashed border-grey-c300 w-full mb-4 ${className}`}/>;
}
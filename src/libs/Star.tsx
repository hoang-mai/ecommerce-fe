import React, {ReactNode} from "react";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarHalfRoundedIcon from "@mui/icons-material/StarHalfRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";

type Props = {
  rating: number;
  fontSize?: "small" | "inherit" | "large" | "medium" | undefined;
}

export default function Star({
    rating,
    fontSize= "small"
  }: Props) {
  const stars: ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<StarRoundedIcon key={i} fontSize={fontSize} className="text-yellow-500"/>);
    } else if (rating >= i - 0.5) {
      stars.push(<StarHalfRoundedIcon key={i} fontSize={fontSize} className="text-yellow-500"/>);
    } else {
      stars.push(<StarBorderRoundedIcon key={i} fontSize={fontSize} className="text-yellow-500"/>);
    }
  }
  return stars;
}
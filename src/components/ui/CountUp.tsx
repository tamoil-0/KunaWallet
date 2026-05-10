import ReactCountUp from "react-countup";

interface KunaCountUpProps {
  end: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
}

export function CountUp({
  end,
  decimals = 0,
  duration = 1.5,
  prefix = "",
  suffix = "",
  separator = ",",
  className,
}: KunaCountUpProps) {
  return (
    <ReactCountUp
      end={end}
      decimals={decimals}
      duration={duration}
      prefix={prefix}
      suffix={suffix}
      separator={separator}
      className={className}
      preserveValue
    />
  );
}

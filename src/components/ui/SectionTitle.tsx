interface SectionTitleProps {
  children: React.ReactNode;
}

export function SectionTitle({ children }: SectionTitleProps) {
  return (
    <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
      {children}
    </p>
  );
}

import { Fragment, useId } from 'react';

const formatValue = (value) => {
  if (value === '' || value === null || value === undefined) return '—';
  return String(value);
};

export default function ShowData({ data = {}, title = 'Form state' }) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="json-inspector">
      <h4 id={headingId}>{title}</h4>
      <dl>
        {Object.entries(data).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{formatValue(value)}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}

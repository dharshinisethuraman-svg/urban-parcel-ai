import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner">
      <AlertTriangle size={16} />
      <span>
        <strong>Cadastral Accuracy Notice:</strong> AI-generated parcel boundaries and building footprints are indicative decision-support representations and require verification by authorized surveying and cadastral professionals before legal or official registration.
      </span>
    </div>
  );
}

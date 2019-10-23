export class User {
         constructor(
           private _token: string,
           private _expiresOn: Date,
           public familyName: string,
           public givenName: string,
           public uniqueId: string
         ){}

         get token() {
             if (!this._expiresOn || this._expiresOn <= new Date()) {
                 return null;
             }
             return this._token;
         }

         get expiresOn() {
           return this._expiresOn;
         }

         get tokenDuration() {
           if (!this.token) {
              return 0;
           }
           return this.expiresOn.getTime() - new Date().getTime();
           
         }
}
